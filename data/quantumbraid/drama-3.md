# Quantumbraid/Drama-3

## Resumen

Drama 3 es un modelo de síntesis de voz (text-to-speech) desarrollado por Fish Audio, orientado a la generación de escenas con múltiples personajes y contenido de formato largo. El modelo combina un backbone de texto de tipo mezcla de expertos (MoE) con 35.899.643.008 parámetros totales y aproximadamente 3.000 millones activos por token, junto con un decodificador de audio basado en codebooks. Esto lo sitúa en una categoría poco habitual: la mayoría de los TTS open weights operan en el rango de cientos de millones a pocos miles de millones de parámetros.

La propuesta diferencial es tratar el audio como una secuencia más: el decodificador emite 10 codebooks de forma causal sobre toda la secuencia, lo que permite editar audio como continuación de una toma anterior en lugar de regenerar desde cero. El modelo acepta hasta 16 etiquetas de hablante (`<|speaker:0|>` a `<|speaker:15|>`) dentro de un mismo texto, hace clonación de voz a partir de una referencia corta (el ejemplo de la model card usa un clip de 3,9 s) y admite control en lenguaje natural, incluyendo eventos paralingüísticos como `[sighs]` o `[laughs]` insertados en la posición exacta donde deben sonar.

Es relevante ahora por tres motivos: cubre 83 idiomas según los metadatos del repositorio (incluido castellano, catalán, gallego y euskera), está soportado desde el día de lanzamiento por SGLang-Omni y vLLM-Omni, y publica métricas de servicio en streaming sobre H200 con TTFA por debajo de 100 ms a concurrencia 1. El repositorio analizado aquí (`Quantumbraid/Drama-3`) es una resubida de terceros del modelo de Fish Audio, con 13 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone de texto MoE con atención híbrida (full + linear); decodificador de audio Codebook-MTP con 10 codebooks decodificados causalmente |
| Parametros totales | 35.899.643.008 (≈35,9 B) |
| Parametros activos | ≈3 B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Expertos MoE en FP8; resto de pesos en bf16. No se documentan GGUF, AWQ ni GPTQ |
| Idiomas soportados | 83 idiomas: zh, en, ja, ko, es, pt, ar, ru, fr, de, sv, it, tr, no, nl, cy, eu, ca, da, gl, ta, hu, fi, pl, et, hi, la, ur, th, vi, jw, bn, yo, sl, cs, sw, nn, he, ms, uk, id, kk, bg, lv, my, tl, sk, ne, fa, af, el, bo, hr, ro, sn, mi, yi, am, be, km, is, az, sd, br, sq, ps, mn, ht, ml, sr, sa, te, ka, bs, pa, lt, kn, si, hy, mr, as, gu, fo |
| Licencia | fish-audio-research-license (license: other) |
| Formato de pesos | safetensors (tamano del repo: 41,5 GB) |
| Pipeline | text-to-speech |
| Etiquetas de hablante | `<\|speaker:0\|>` … `<\|speaker:15\|>` (hasta 16 personajes por texto) |

## Arquitectura y entrenamiento

La arquitectura se divide en dos bloques. El primero es un backbone de lenguaje de tipo MoE con atención híbrida, que combina capas de atención completa con capas de atención linear; esto reduce el coste de cómputo y memoria en secuencias largas, algo crítico cuando el texto de entrada se trocea automáticamente y se procesa por fragmentos. El segundo es un decodificador de audio Codebook-MTP que genera 10 codebooks de forma causal sobre la secuencia completa, en lugar de decodificar por ventanas independientes. Ese diseño es lo que habilita la edición como continuación: el modelo recibe los tokens VQ de tomas anteriores como contexto y produce una nueva toma coherente con ellas.

En cuanto a precisión numérica, los expertos MoE se almacenan en FP8 mientras el resto de pesos permanece en bf16, una combinación que reduce el peso total a 41,5 GB y que el tag `bsgemm-moe` del repositorio asocia a kernels GEMM de precisión mixta por bloques. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO.

Las innovaciones técnicas destacables documentadas son: el esquema de 10 codebooks decodificados causalmente, el troceado automático de texto largo con streaming por fragmento, las etiquetas de hablante para diálogo multi-personaje y el uso de tomas previas (`previous_takes`) como contexto de edición encadenada.

## Capacidades

- Síntesis de voz multi-hablante: hasta 16 personajes diferenciados en un mismo texto mediante etiquetas `<|speaker:N|>`.
- Clonación de voz a partir de una referencia corta con su transcripción (el ejemplo de la model card usa un clip de 3,9 s).
- Generación de habla emocional y control en lenguaje natural, con etiquetas de evento en el punto exacto del texto (`[sighs]`, `[laughs]`).
- Edición de audio como continuación: se envían los tokens VQ de tomas previas y el modelo regenera la toma; admite encadenar varias ediciones.
- Procesamiento de texto largo con troceado automático y streaming por fragmento.
- Cobertura multilingüe de 83 idiomas, incluyendo castellano, catalán, gallego y euskera.
- Servicio en streaming con API compatible con `/v1/tts`, incluyendo referencias por ruta local o URL.
- No se documentan en la información disponible capacidades de tool calling, razonamiento multi-paso ni visión.

## Casos de uso

- Audiolibros y ficción con diálogo: el modelo distingue hasta 16 hablantes en un mismo texto mediante etiquetas, de modo que un capítulo con varios personajes se genera en una sola pasada sin concatenar clips de voces distintas.
- Doblaje y localización: con 83 idiomas y clonación a partir de una referencia, se puede mantener el timbre del actor original en la versión doblada partiendo de un clip corto y su transcripción.
- Corrección de locuciones sin regenerar todo el audio: usando `previous_takes`, un cambio puntual (por ejemplo, "Wednesday" por "Thursday") se produce como continuación de la toma anterior, preservando el resto de la locución y el ritmo.
- Podcasts y contenido conversacional generado: la combinación de multi-hablante, eventos paralingüísticos y streaming por fragmento permite emitir audio mientras se genera el guion, con TTFA por debajo de 100 ms a concurrencia 1.
- Asistentes de voz y atención al cliente: la API `/v1/tts` con referencias y streaming encaja en pipelines de baja latencia; a concurrencia 16 el sistema sigue generando audio a un ritmo superior al tiempo real (RTF 0,373).
- Producción de anuncios y contenido corto con control emocional: las etiquetas de evento insertadas en el texto permiten colocar suspiros, risas u otras marcas expresivas en la posición exacta de la locución.
- Accesibilidad y lectura de contenido largo: el troceado automático permite procesar documentos extensos y emitir audio de forma progresiva sin esperar a la generación completa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (WER, similitud de hablante, MOS, Seed-TTS-Eval) en la información disponible. Los únicos datos numéricos publicados son métricas de servicio en streaming, medidas sobre GPU NVIDIA H200 con peticiones de streaming sobre prompts en inglés de Seed-TTS, clonando voz desde una referencia pre-codificada (`vq_codes` con su transcripción), con `temperature` 1.0, `top_p` 0.9, `top_k` 30 y `max_new_tokens` 500. Cada celda es la media de cuatro ejecuciones.

| Concurrencia | Throughput (frames/s) | TTFA p50 | TTFA p95 | RTF (media) |
|---:|---:|---:|---:|---:|
| 1 | 166,7 | 88,9 ms | 90,8 ms | 0,131 |
| 2 | 287,0 | 96,2 ms | 130,1 ms | 0,152 |
| 4 | 467,6 | 108,2 ms | 156,4 ms | 0,186 |
| 8 | 678,1 | 153,2 ms | 210,9 ms | 0,256 |
| 16 | 927,6 | 210,1 ms | 287,2 ms | 0,373 |
| 32 | 1.244,7 | 304,6 ms | 396,1 ms | 0,551 |
| 64 | 1.687,3 | 450,9 ms | 1.020,1 ms | 0,801 |

El RTF se define como el tiempo desde el envío de la petición hasta el último fragmento de audio, dividido por la duración del audio devuelto. Con RTF por debajo de 1 en todas las filas, una sola H200 mantiene generación más rápida que el tiempo real incluso a concurrencia 64.

## Requisitos de hardware

- Peso de los pesos: 41,5 GB en el repositorio (expertos MoE en FP8, resto en bf16). La VRAM necesaria para cargar el modelo es de al menos unos 42 GB, antes de KV cache y buffers del decodificador de audio.
- GPU de referencia en las mediciones publicadas: NVIDIA H200 (141 GB). Es la configuración con la que se obtuvieron los datos de throughput y TTFA.
- GPU recomendadas: H200 para máxima concurrencia; H100 80 GB y A100 80 GB son opciones plausibles por capacidad de memoria, aunque no se publican mediciones sobre ellas.
- GPU de consumo: no cabe en una RTX 4090 (24 GB) ni en tarjetas de 48 GB en su forma actual. No se documentan GGUF, AWQ ni GPTQ, por lo que no hay una ruta de cuantización de 4 bits publicada.
- Despliegue: SGLang-Omni (`sgl-omni serve --model-path fishaudio/drama-3 --port 8000`, instalación con el extra `fishaudio`) y vLLM-Omni (`vllm serve fishaudio/drama-3 --omni --port 8091`). No se menciona soporte de llama.cpp, Ollama ni TGI.
- Latencia: TTFA p50 de 88,9 ms a concurrencia 1 y 450,9 ms a concurrencia 64; p95 de 90,8 ms y 1.020,1 ms respectivamente.
- Throughput: de 166,7 frames/s con un solo stream a 1.687,3 frames/s con 64 streams concurrentes en una H200.

## Comparativa con modelos similares

No se dispone de datos comparativos de benchmarks en la información proporcionada, por lo que la comparación numérica con alternativas no está disponible. A continuación se indica únicamente lo que consta para Drama 3 y se marcan como no disponibles los campos de los que no hay información verificable en esta ficha.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Drama 3 (Fish Audio) | 35,9 B totales / ~3 B activos | no disponible | 83 | fish-audio-research-license | safetensors, SGLang-Omni y vLLM-Omni |
| Alternativas de TTS open weights de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

Criterios cualitativos donde Drama 3 se diferencia de la mayoría de alternativas de código abierto: el tamaño del backbone (35,9 B frente a modelos habitualmente mucho menores), el número de hablantes simultáneos en un mismo texto (16) y el mecanismo de edición como continuación sobre tokens VQ previos, que no consta en las alternativas consultadas.

## Limitaciones y advertencias

- Licencia de investigación: `fish-audio-research-license`. No es una licencia de uso comercial general; es imprescindible revisar `LICENSE.md` antes de cualquier despliegue en producción o de redistribuir el modelo.
- El repositorio analizado es una resubida de terceros (`Quantumbraid/Drama-3`) con 13 descargas; para producción conviene referenciar el repositorio oficial de Fish Audio (`fishaudio/drama-3`), que es el que aparece en los comandos de despliegue de la model card.
- Riesgo de clonación de voz: la combinación de referencia corta (3,9 s en el ejemplo) y clonación sin modificación abre la puerta a suplantación de identidad y deepfakes. No se documentan en la información disponible mecanismos de marca de agua, detección ni filtros de consentimiento.
- Alucinación y errores de pronunciación: no se publican métricas de WER ni de similitud de hablante, por lo que la fidelidad de la pronunciación por idioma no está cuantificada, especialmente en los idiomas de menor recursos de la lista de 83.
- Cobertura idiomática desigual: la lista de 83 idiomas proviene de los metadatos del repositorio; no se especifica el volumen de datos de entrenamiento por idioma, y los ejemplos de la model card son exclusivamente en inglés.
- Longitud de contexto no documentada: no se indica el límite de tokens de texto ni de audio por petición, más allá del troceado automático de textos largos.
- Sin ruta de cuantización publicada: no hay GGUF, AWQ ni GPTQ, lo que limita el despliegue a hardware de 80 GB o superior.
- Los datos de rendimiento proceden de una única H200 con prompts en inglés; no hay mediciones multi-GPU ni sobre otras arquitecturas.
- Sesgos: no se documenta ninguna evaluación de sesgos demográficos, de acento o de género en las voces generadas.
- Fecha de creación del repositorio: 21 de octubre de 2026, sin actualizaciones posteriores según los metadatos.

## Enlaces

- Modelo en HuggingFace (resubida): https://huggingface.co/Quantumbraid/Drama-3
- Repositorio oficial referenciado en la model card: https://huggingface.co/fishaudio/drama-3
- Licencia: https://huggingface.co/Quantumbraid/Drama-3/blob/main/LICENSE.md
- Paper (referencia arXiv en los tags): https://arxiv.org/abs/2610.18010
- Documentación de SGLang-Omni: https://sgl-project.github.io/sglang-omni/
- Cookbook de Drama 3 en SGLang-Omni: https://sgl-project.github.io/sglang-omni/cookbook/fishaudio_drama3.html
- Repositorio SGLang-Omni: https://github.com/sgl-project/sglang-omni
- Repositorio vLLM-Omni: https://github.com/vllm-project/vllm-omni
- Recipe de Drama 3 en vLLM-Omni: https://recipes.vllm.ai/fishaudio/drama-3
- Clip de referencia usado en los ejemplos (`en0`, 3,9 s): https://github.com/user-attachments/files/33393249/en0.wav
- Dataset de evaluación Seed-TTS mini citado en los ejemplos: https://huggingface.co/datasets/zhaochenyang20/seed-tts-eval-mini
- Ejemplo de etiquetas de evento: https://github.com/user-attachments/files/33393205/A1_point_tags.wav
- Ejemplo de edición con contexto: https://github.com/user-attachments/files/33393156/K1_edit_word_with_context.wav
- Ejemplo de segunda edición encadenada: https://github.com/user-attachments/files/33393164/K5_second_edit_chained.wav
