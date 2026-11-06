# hossein95/drama-3

## Resumen
Fish Audio Drama 3 es un modelo de síntesis de voz (text-to-speech) de nueva generación desarrollado por Fish Audio, diseñado específicamente para escenas con múltiples personajes y contenido de formato largo. El modelo resuelve el problema de generar diálogos multi-hablante coherentes y con control expresivo en lenguaje natural, algo que los sistemas TTS tradicionales abordan de forma limitada. Su relevancia actual radica en que combina un backbone de lenguaje de gran escala con un decodificador de audio, permitiendo clonación de voz, edición de audio y generación emocional en una sola arquitectura.

La arquitectura emplea un backbone de texto MoE (Mixture of Experts) de 35.000 millones de parámetros totales con 3.000 millones activos por token, combinando atención completa y lineal (híbrida). Incluye un decodificador de audio basado en Codebook-MTP que decodifica 10 codebooks de forma causal sobre toda la secuencia. El modelo soporta hasta 16 hablantes distintos mediante etiquetas `<|speaker:0|>` a `<|speaker:15|>`, y el texto largo se divide automáticamente en fragmentos que pueden transmitirse en streaming.

El modelo se distribuye con licencia de investigación de Fish Audio y está disponible en Hugging Face con pesos en safetensors. Su despliegue en producción es posible mediante SGLang-Omni y vLLM-Omni, con soporte desde el día de lanzamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) con atención híbrida (completa + lineal) y decodificador de audio Codebook-MTP |
| Parámetros totales | 35.899.643.008 (aproximadamente 35,9 mil millones) |
| Parámetros activos | 3 mil millones por token |
| Longitud de contexto | no disponible |
| Tipos de cuantización | FP8 para expertos MoE; resto de pesos en bf16 |
| Idiomas soportados | zh, en, ja, ko, es, pt, ar, ru, fr, de, sv, it, tr, no, nl, cy, eu, ca, da, gl, ta, hu, fi, pl, et, hi, la, ur, th, vi, jw, bn, yo, sl, cs, sw, nn, he, ms, uk, id, kk, bg, lv, my, tl, sk, ne, fa, af, el, bo, hr, ro, sn, mi, yi, am, be, km, is, az, sd, br, sq, ps, mn, ht, ml, sr, sa, te, ka, bs, pa, lt, kn, si, hy, mr, as, gu, fo (más de 80 idiomas) |
| Licencia | fish-audio-research-license |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo se basa en un transformer con arquitectura MoE (Mixture of Experts) en el backbone de texto, donde solo 3.000 millones de parámetros están activos por token de un total de 35.900 millones. La atención es híbrida, combinando mecanismos de atención completa y lineal para gestionar secuencias largas de manera eficiente. Para la generación de audio, emplea un decodificador Codebook-MTP (Multi-Token Prediction) que decodifica 10 codebooks de forma causal sobre la secuencia completa, lo que permite una generación de audio coherente y de alta calidad.

Los detalles sobre el volumen de datos de entrenamiento, la composición del dataset y si se emplearon técnicas de RLHF o DPO no están disponibles en la información proporcionada. La innovación técnica destacable es la integración de un backbone de lenguaje de gran escala con un decodificador de audio especializado, junto con el uso de FP8 para los expertos MoE (reduciendo el uso de memoria) y el resto de pesos en bf16. El modelo también soporta edición de audio como continuación, enviando tokens VQ previos como contexto, y permite el streaming por fragmentos para texto largo.

## Capacidades
- Generación de voz multi-hablante: soporta hasta 16 personajes distintos en un mismo texto mediante etiquetas `<|speaker:0|>` a `<|speaker:15|>`.
- Clonación de voz: clona una voz de referencia a partir de un clip de audio y su transcripción.
- Control en lenguaje natural: permite introducir etiquetas de eventos como `[sighs]` o `[laughs]` en el texto para controlar la expresividad.
- Edición de audio como continuación: permite modificar palabras o frases de una toma anterior enviando los tokens VQ previos como contexto, encadenando múltiples ediciones.
- Generación emocional: capacidad de generar habla con carga emocional según las etiquetas y el contexto.
- Soporte multilingüe: más de 80 idiomas, incluyendo español, inglés, chino, japonés, coreano, árabe, ruso, francés, alemán, entre otros.
- Streaming: el texto largo se divide automáticamente en fragmentos que pueden transmitirse en streaming para baja latencia.
- No se menciona soporte de tool calling, function calling ni agentes multi-paso en la información disponible.

## Casos de uso
- Producción de audiolibros y ficción sonora: el modelo puede generar diálogos con múltiples personajes (hasta 16) y clonar voces distintas para cada uno, manteniendo coherencia en escenas largas gracias a la división automática en fragmentos y el streaming.
- Doblaje y localización de contenido: con soporte para más de 80 idiomas, permite clonar la voz de un actor original y generar el doblaje en otro idioma conservando el timbre y la expresividad, útil para series, películas o vídeos.
- Asistentes de voz y atención al cliente: la clonación de voz y el control emocional permiten crear agentes conversacionales con una voz de marca consistente y respuestas expresivas, con baja latencia (TTFA inferior a 100 ms en un solo stream).
- Edición de podcast y postproducción de audio: la capacidad de edición como continuación permite corregir palabras o frases en una grabación existente sin regrabar toda la toma, encadenando ediciones sucesivas con contexto.
- Generación de contenido para videojuegos: permite generar voces de múltiples personajes (PNJ) de forma dinámica y expresiva, con control de eventos como suspiros o risas, y con la posibilidad de clonar voces de actores de doblaje.
- Creación de contenido para redes sociales y marketing: generación rápida de locuciones multi-idioma con voces clonadas y control emocional, adecuada para vídeos promocionales o anuncios personalizados.
- Accesibilidad y lectura de textos: conversión de texto a voz de alta calidad con múltiples voces y control de expresividad para aplicaciones de lectura asistida o narración automática.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma explícita. Con 35,9 mil millones de parámetros totales y expertos MoE en FP8, el uso de memoria es significativo; se requiere al menos una GPU con 80 GB de VRAM para cargar el modelo completo en precisión mixta (FP8 + bf16), aunque no se confirma en la información.
- GPU recomendadas: NVIDIA H200 (utilizada para las mediciones de rendimiento). Se desconoce si cabe en GPUs de consumo como RTX 4090 (24 GB) o RTX 3090; por el tamaño del modelo, es probable que no quepa en una sola GPU de consumo sin cuantización adicional no especificada.
- Opciones de despliegue: SGLang-Omni y vLLM-Omni, con soporte desde el día de lanzamiento. Los comandos de instalación y servicio están documentados en la model card.
- Latencia y throughput estimados: en una NVIDIA H200, con una concurrencia de 1, el throughput es de 166,7 frames/s, TTFA p50 de 88,9 ms y RTF medio de 0,131. Con concurrencia 16, el throughput sube a 927,6 frames/s y el TTFA p50 a 210,1 ms. Con concurrencia 64, el throughput alcanza 1.687,3 frames/s y el TTFA p50 es de 450,9 ms. Estos datos provienen de peticiones en streaming sobre prompts en inglés de Seed-TTS, con temperature 1.0, top_p 0.9, top_k 30 y max_new_tokens 500.

## Comparativa con modelos similares
No se dispone de información sobre modelos comparables en la documentación proporcionada. Se indica "no disponible".

## Limitaciones y advertencias
- Sesgos conocidos: no se detallan en la información proporcionada, pero al ser un modelo entrenado con datos de voz, puede heredar sesgos de género, acento o etnia presentes en los datos.
- Riesgo de alucinación: no se menciona explícitamente, pero en TTS la alucinación puede manifestarse como artefactos de audio, pronunciación incorrecta o generación de contenido no solicitado.
- Limitaciones de contexto o idioma: aunque soporta más de 80 idiomas, el rendimiento puede variar entre ellos; no se especifica la longitud máxima de contexto para texto o audio.
- Restricciones de licencia: la licencia fish-audio-research-license es para investigación; el uso comercial puede estar restringido o requerir permisos adicionales. Es necesario revisar el archivo LICENSE.md para conocer los términos exactos.
- Caveats para producción: el modelo requiere GPUs de alta gama (H200 en las pruebas) y no se confirma su viabilidad en hardware de consumo. La edición de audio como continuación requiere gestionar el contexto de tomas previas, lo que puede aumentar la complejidad del pipeline.

## Enlaces
- [Hugging Face - hossein95/drama-3](https://huggingface.co/hossein95/drama-3)
- [SGLang-Omni](https://sgl-project.github.io/sglang-omni/)
- [Drama 3 Cookbook (SGLang-Omni)](https://sgl-project.github.io/sglang-omni/cookbook/fishaudio_drama3.html)
- [vLLM-Omni](https://github.com/vllm-project/vllm-omni)
- [Drama 3 vLLM-Omni Recipe](https://recipes.vllm.ai/fishaudio/drama-3)
- [Paper arXiv:2610.18010](https://arxiv.org/abs/2610.18010) (referenciado en los tags, no se proporciona enlace directo en la información)
