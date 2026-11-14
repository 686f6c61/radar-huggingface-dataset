# prithivMLmods/drama-3-TTS-GGUF

## Resumen

drama-3-TTS-GGUF es la versión cuantizada en formato GGUF del modelo de síntesis de voz Fish Audio Drama 3, publicada por el usuario prithivMLmods. Se trata de un modelo de texto a voz orientado a escenas multi-personaje y contenido de formato largo, construido sobre un backbone de mezcla de expertos (MoE) de tipo Qwen3.5 con atención híbrida (completa y lineal) y un decodificador de audio de tipo codebook-MTP sobre 10 codebooks.

El modelo original, desarrollado por Fish Audio, cuenta con aproximadamente 34,68 mil millones de parámetros totales y unos 3 mil millones activos por token, lo que lo sitúa en la categoría de MoE disperso. Esta versión GGUF permite ejecutarlo con llama.cpp mediante la herramienta `llama-tts`, incluyendo el proyector multimodal en BF16 necesario para las capacidades de audio. La relevancia actual radica en que permite desplegar un TTS de gama alta en hardware de consumo o en servidores sin necesidad de infraestructura propietaria.

La ficha cubre tanto las especificaciones del modelo base como las particularidades de esta cuantización, incluyendo los distintos niveles de cuantización disponibles (desde Q3_K_M hasta Q6_K y MXFP4_MOE) y las limitaciones derivadas de la licencia de investigación de Fish Audio, que restringe el uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE (qwen3_5_moe) con atención híbrida completa y lineal; decodificador de audio codebook-MTP sobre 10 codebooks; proyector multimodal |
| Parámetros totales | 34.676.863.616 (~34,7 B) |
| Parámetros activos | ~3 B por token (3AB) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | MXFP4_MOE, Q3_K_L, Q3_K_M, Q4_K_M, Q5_K_M, Q5_K_S, Q6_K; proyector mmproj en BF16 |
| Idiomas soportados | ~80 idiomas, entre ellos zh, en, ja, ko, es, pt, ar, ru, fr, de, sv, it, tr, no, nl, cy, eu, ca, da, gl, ta, hu, fi, pl, et, hi, la, ur, th, vi, jw, bn, yo, sl, cs, sw, nn, he, ms, uk, id, kk, bg, lv, my, tl, sk, ne, fa, af, el, bo, hr, ro, sn, mi, yi, am, be, km, is, az, sd, br, sq, ps, mn, ht, ml, sr, sa, te, ka, bs, pa, lt, kn, si, hy, mr, as, gu, fo |
| Licencia | fish-audio-research-license (other) |
| Formato de pesos | GGUF (con mmproj BF16); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base emplea un backbone de texto de mezcla de expertos con atención híbrida que combina capas de atención completa y lineal, lo que reduce el coste computacional en secuencias largas manteniendo capacidad de modelado global. Los expertos están almacenados en FP8 en el modelo original. La salida de texto se transforma en audio mediante un decodificador codebook-MTP que opera sobre 10 codebooks, y un proyector multimodal conecta la representación textual con el espacio acústico.

No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO. La model card del autor de la cuantización no incluye estos datos, y la información proporcionada no los detalla. La innovación técnica destacable es el soporte de generación multi-personaje (hasta 16 hablantes mediante etiquetas `<|speaker:0|>` a `<|speaker:15|>`), el control en lenguaje natural con etiquetas inline como `[sighs]` y `[laughs]`, la clonación de voz a partir de un clip de referencia corto y la edición por continuación (pasar tomas previas como contexto y modificar solo algunas palabras).

## Capacidades

- Generación de voz multi-personaje con hasta 16 hablantes etiquetados en el prompt.
- Clonación de voz a partir de un clip de referencia corto.
- Control en lenguaje natural de la expresión, incluyendo etiquetas inline de sonidos no verbales (`[sighs]`, `[laughs]`).
- Edición por continuación: reutilizar tomas anteriores como contexto y modificar únicamente fragmentos concretos.
- Generación de contenido de formato largo con troceado automático de texto y streaming.
- Cobertura de aproximadamente 80 idiomas, incluyendo español, catalán, euskera y gallego.
- Soporte de despliegue en SGLang-Omni y vLLM-Omni para el modelo base.
- Integración con llama.cpp mediante `llama-tts` en esta versión GGUF.
- No se documentan en la información disponible capacidades de tool calling, function calling ni razonamiento multi-paso, al tratarse de un modelo de texto a voz.

## Casos de uso

- Audiolibros y ficción sonora: el modelo puede narrar escenas con varios personajes diferenciados usando las etiquetas de hablante, manteniendo coherencia de voz por personaje a lo largo de capítulos largos gracias al troceado automático y al streaming.
- Doblaje y localización: con cobertura de ~80 idiomas y clonación de voz, permite generar versiones dobladas de contenido preservando el timbre del actor original a partir de un clip de referencia.
- Producción de podcast y radio: la generación multi-turno con etiquetas de expresión (`[laughs]`, `[sighs]`) permite crear diálogos con matices emocionales sin grabación humana.
- Asistentes de voz y atención al cliente: la clonación de voz y el control en lenguaje natural permiten desplegar una voz de marca consistente en sistemas conversacionales, con latencia baja en el modelo base (primer audio en menos de 100 ms en un H200).
- Accesibilidad y lectura de textos: conversión de documentos largos a audio con voces naturales y soporte multilingüe, útil para usuarios con discapacidad visual.
- Edición de audio y postproducción: la funcionalidad de edición por continuación permite corregir palabras concretas en una toma ya generada sin regenerar toda la locución.
- Prototipado en hardware de consumo: las cuantizaciones Q3 y Q4 permiten ejecutar el modelo en estaciones de trabajo con GPU de consumo mediante llama.cpp, útil para pruebas de concepto y demos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

Los únicos datos de rendimiento proporcionados corresponden a métricas de inferencia del modelo base en un H200: primer audio en menos de 100 ms en un solo stream, factor de tiempo real de aproximadamente 0,13 y throughput de unas 1.687 frames/s con 64 streams concurrentes. Al colocar el vocoder en una segunda GPU, el throughput aumenta un 72% y la mediana del tiempo hasta el primer audio se reduce un 37% con 256 streams.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización: Q3_K_M ~16,8 GB; Q3_K_L ~18,1 GB; MXFP4_MOE ~19,8 GB; Q4_K_M ~21,2 GB; Q5_K_S ~24 GB; Q5_K_M ~24,7 GB; Q6_K ~28,5 GB. Añadir ~2,94 GB del proyector mmproj en BF16.
- GPU recomendadas: H200 para el modelo base con máximo throughput; para las cuantizaciones GGUF, GPU con 24 GB o más (RTX 4090, RTX 3090, A6000) para Q4/Q5; GPU con 32 GB o más (RTX 5090, A100 40 GB) para Q6.
- MXFP4_MOE está optimizado para hardware NVIDIA Blackwell (RTX Pro 6000, serie RTX 50, B200, B300) con Tensor Cores FP4 nativos.
- En GPU de consumo: Q4_K_M (~21,2 GB) y Q5_K_S (~24 GB) caben en RTX 4090 de 24 GB; Q6_K requiere 32 GB o más.
- Opciones de despliegue: llama.cpp compilando el target `llama-tts` con backend CUDA y offloading de capas (`-ngl 99`); el modelo base admite SGLang-Omni y vLLM-Omni.
- Latencia y throughput: no se han publicado métricas específicas para las versiones GGUF en la información disponible; las cifras del modelo base en H200 se indican en la sección de benchmarks.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| drama-3-TTS-GGUF (esta ficha) | ~34,7 B totales, ~3 B activos | no disponible | ~80 | fish-audio-research-license | GGUF |
| fishaudio/drama-3 (base) | ~34,7 B totales, ~3 B activos | no disponible | ~80 | fish-audio-research-license | safetensors |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos sobre otros modelos TTS comparables (por ejemplo, de otros fabricantes) que permitan una comparación cuantitativa de parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- La licencia fish-audio-research-license restringe el uso comercial; es imprescindible revisar los términos antes de cualquier despliegue en producción.
- Riesgo de alucinación acústica y de artefactos en la voz generada, especialmente en cuantizaciones bajas (Q3_K_M y Q3_K_L se describen como de calidad baja o "usable").
- Las cuantizaciones Q3 pueden degradar la naturalidad y la estabilidad de la voz clonada; se recomienda Q4_K_M o superior para producción.
- No se dispone de información sobre sesgos de género, acento o etnia en las voces generadas; la clonación de voz plantea riesgos de suplantación y requiere consentimiento explícito.
- La longitud de contexto no está documentada, lo que dificulta planificar el troceado de textos muy largos.
- El rendimiento en hardware de consumo no está medido en la información disponible; las cifras de latencia y throughput corresponden al modelo base en H200.
- El repo tiene 0 descargas y 1 like en el momento de la consulta, por lo que no hay evidencia comunitaria de validación de las cuantizaciones.
- El proyector mmproj en BF16 añade ~2,94 GB de VRAM y debe descargarse por separado junto con el GGUF.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/prithivMLmods/drama-3-TTS-GGUF
- Modelo base: https://huggingface.co/fishaudio/drama-3
- Licencia: https://huggingface.co/fishaudio/drama-3/blob/main/LICENSE
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Release de llama.cpp con soporte drama-3 TTS: https://github.com/ggml-org/llama.cpp/releases/tag/v1.0.0
- Archivo MXFP4_MOE: https://huggingface.co/prithivMLmods/drama-3-TTS-GGUF/blob/main/drama-3.MXFP4_MOE.gguf
- Archivo Q4_K_M: https://huggingface.co/prithivMLmods/drama-3-TTS-GGUF/blob/main/drama-3.Q4_K_M.gguf
- Archivo Q5_K_M: https://huggingface.co/prithivMLmods/drama-3-TTS-GGUF/blob/main/drama-3.Q5_K_M.gguf
- Archivo Q6_K: https://huggingface.co/prithivMLmods/drama-3-TTS-GGUF/blob/main/drama-3.Q6_K.gguf
- Proyector multimodal: https://huggingface.co/prithivMLmods/drama-3-TTS-GGUF/blob/main/drama-3.mmproj-bf16.gguf
