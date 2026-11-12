# AMAImedia/FishAudio-Drama3-TTS-83Lang-Qwen3.5-35B-A3B-FP8-BF16-GGUF

## Resumen

Fish Audio Drama 3 es un modelo de síntesis de voz (text-to-speech) desarrollado por Fish Audio, orientado a la generación de escenas multi-personaje y contenido de formato largo. Esta ficha concreta, publicada por AMAImedia, es una cuantización del modelo base `fishaudio/drama-3` en FP8 (expertos MoE) y BF16 (resto de pesos), con variantes GGUF, lo que facilita su despliegue en entornos con recursos limitados. El modelo resuelve el problema de generar diálogos con múltiples voces diferenciadas, clonación de voz y edición de audio mediante lenguaje natural, todo dentro de una única pasada de generación.

La arquitectura combina un backbone de texto Qwen3.5 de 35.899.643.008 parámetros totales con 3B activos por token (MoE con atención híbrida full + linear) y un decodificador de audio Codebook-MTP de 10 codebooks decodificados de forma causal sobre toda la secuencia. Soporta hasta 16 personajes por texto mediante etiquetas `<|speaker:0|>` a `<|speaker:15|>`, y el texto largo se divide automáticamente en fragmentos con streaming por chunk.

Su relevancia actual radica en la cobertura de 83 idiomas (incluyendo castellano, catalán, euskera y gallego), la licencia de investigación Fish Audio Research License y la disponibilidad de pesos en safetensors y GGUF, lo que permite tanto investigación como despliegue en producción con SGLang-Omni desde el día de lanzamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE con backbone de texto Qwen3.5 y decodificador de audio Codebook-MTP; atención híbrida (full + linear) |
| Parámetros totales | 35.899.643.008 |
| Parámetros activos | 3B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantización | FP8 (expertos MoE), BF16 (resto de pesos), GGUF |
| Idiomas soportados | 83 idiomas, entre ellos zh, en, ja, ko, es, pt, ar, ru, fr, de, sv, it, tr, no, nl, cy, eu, ca, da, gl, ta, hu, fi, pl, et, hi, la, ur, th, vi, jw, bn, yo, sl, cs, sw, nn, he, ms, uk, id, kk, bg, lv, my, tl, sk, ne, fa, af, el, bo, hr, ro, sn, mi, yi, am, be, km, is, az, sd, br, sq, ps, mn, ht, ml, sr, sa, te, ka, bs, pa, lt, kn, si, hy, mr, as, gu, fo |
| Licencia | Fish Audio Research License (etiquetada como apache-2.0 en los metadatos, con license_name fish-audio-research-license) |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo se basa en un backbone de texto Qwen3.5 de tipo Mixture of Experts con 35.899.643.008 parámetros totales y 3B activos por token, combinando atención completa y atención linear en un esquema híbrido. Sobre este backbone se acopla un decodificador de audio Codebook-MTP que decodifica 10 codebooks de forma causal a lo largo de toda la secuencia, lo que permite generar audio coherente con el contexto textual completo. Los expertos MoE se almacenan en FP8 mientras que el resto de pesos permanece en BF16, una decisión de cuantización que reduce el tamaño del repositorio a 65,1 GB.

No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card menciona soporte para clonación de voz, generación multi-hablante y control en lenguaje natural, así como edición de audio entendida como continuación (enviando los tokens VQ previos como contexto, de forma análoga a un modelo de lenguaje). El texto largo se fragmenta automáticamente y puede emitirse en streaming por fragmentos.

## Capacidades

- Generación de voz multi-personaje: hasta 16 hablantes diferenciados en un mismo texto mediante etiquetas `<|speaker:0|>` a `<|speaker:15|>`.
- Clonación de voz a partir de un clip de referencia con su transcripción.
- Control en lenguaje natural de la expresividad, incluyendo etiquetas puntuales como `[sighs]` o `[laughs]` insertadas en el texto.
- Edición de audio como continuación: se envían las tomas previas (`previous_takes`) y el modelo genera una versión modificada manteniendo coherencia con el contexto anterior.
- Generación de contenido de formato largo con división automática de texto y streaming por fragmentos.
- Cobertura multilingüe de 83 idiomas, con presencia de lenguas peninsulares (es, ca, eu, gl).
- No se ha documentado soporte de tool calling, function calling ni razonamiento multi-paso en la información disponible.

## Casos de uso

- Doblaje multilingüe automatizado: el modelo cubre 83 idiomas y permite generar una misma escena con voces consistentes en cada idioma, lo que encaja con la plataforma de doblaje NOESIS/AMAImedia en la que se enmarca la publicación.
- Producción de audiolibros y ficción sonora: la capacidad multi-hablante (hasta 16 personajes) y el chunking automático de texto largo permiten narrar capítulos completos con voces diferenciadas por personaje sin segmentación manual.
- Edición de locuciones sin re-grabar: mediante `previous_takes`, un cambio de palabra o de hora en un guion ("by noon" a "by five") se regenera manteniendo el resto de la toma, útil en posproducción publicitaria y corporativa.
- Localización de videojuegos: la clonación de voz con referencia corta (el ejemplo usa un clip de 3,9 s) permite mantener la identidad vocal de personajes a lo largo de múltiples líneas de diálogo en distintos idiomas.
- Asistentes de voz y atención al cliente: la generación con control emocional mediante etiquetas puntuales permite respuestas con entonación adecuada al contexto conversacional.
- Accesibilidad y lectura de contenido: conversión de texto a voz en castellano, catalán, euskera y gallego para lectores de pantalla o servicios de accesibilidad, con salida en streaming por fragmentos.
- Prototipado de voces en investigación: la disponibilidad de pesos en GGUF y FP8/BF16 permite experimentar en hardware de consumo y comparar variantes de cuantización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el repositorio completo ocupa 65,1 GB, por lo que en BF16/FP8 se requiere hardware de gama alta (H200 o Blackwell, según el propio autor de la cuantización).
- GPU recomendadas: el autor indica que el trabajo de cuantización de modelos de 9B en adelante requiere H200/Blackwell alquiladas; para inferencia en producción se recomienda GPU con al menos 80 GB de VRAM en configuraciones FP8/BF16.
- ¿Cabe en GPU de consumo? Las variantes GGUF podrían permitir ejecución parcial en GPU de consumo con offloading a RAM, pero no hay datos oficiales de rendimiento ni de VRAM mínima por cuantización.
- Opciones de despliegue: SGLang-Omni (`sgl-omni serve --model-path fishaudio/drama-3 --port 8000`), con instalación mediante `uv pip install --prerelease=allow -v -e ".[fishaudio]"`. Para GGUF se puede usar llama.cpp u Ollama, aunque no se documenta en la model card.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formatos |
|---|---|---|---|---|---|
| Fish Audio Drama 3 (esta ficha) | 35,9B totales / 3B activos | no disponible | 83 | Fish Audio Research License | safetensors, GGUF |
| fishaudio/drama-3 (base) | 35,9B totales / 3B activos | no disponible | 83 | Fish Audio Research License | safetensors |
| Alternativas TTS open source de gran escala | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente en la documentación proporcionada para establecer una comparativa cuantitativa con modelos TTS alternativos de la misma categoría.

## Limitaciones y advertencias

- Licencia: los metadatos declaran `apache-2.0` pero el campo `license_name` y el enlace apuntan a la Fish Audio Research License; es imprescindible revisar `LICENSE.md` antes de cualquier uso comercial, ya que una licencia de investigación puede restringir la explotación comercial.
- La cuantización FP8/BF16 y las variantes GGUF pueden introducir degradación en la calidad de audio respecto al modelo base en BF16 puro; no se han publicado métricas de fidelidad por cuantización.
- Riesgo de alucinación acústica y de artefactos en la clonación de voz, especialmente con referencias muy cortas o ruidosas.
- No se documentan sesgos específicos por idioma o género, pero la cobertura desigual de los 83 idiomas implica que la calidad en lenguas de bajos recursos (por ejemplo, `fo`, `mi`, `sn`) puede ser inferior a la de zh/en.
- El uso de clonación de voz plantea riesgos de suplantación de identidad y requiere consentimiento explícito de la persona cuya voz se clona, además de cumplimiento normativo (por ejemplo, AI Act en la UE).
- No hay información sobre longitud máxima de contexto ni sobre límites de duración de audio generado por petición.
- El modelo está pensado para TTS y edición de audio; no debe emplearse como modelo de lenguaje general pese a su backbone Qwen3.5.
- La fecha de creación (2026-10-14) y los identificadores de arXiv (`2610.18010`) deben verificarse en la fuente original antes de citarlos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AMAImedia/FishAudio-Drama3-TTS-83Lang-Qwen3.5-35B-A3B-FP8-BF16-GGUF
- Modelo base: https://huggingface.co/fishaudio/drama-3
- SGLang-Omni: https://sgl-project.github.io/sglang-omni/
- Drama 3 Cookbook: https://sgl-project.github.io/sglang-omni/cookbook/fishaudio_drama3.html
- Repositorio SGLang-Omni: https://github.com/sgl-project/sglang-omni
- Organización AMAImedia: https://www.amaimedia.com
- X/Twitter del autor: https://x.com/AMAImediacom
- LinkedIn del autor: https://www.linkedin.com/in/ilia-bolotnikov
- Telegram del autor: https://t.me/AMAImediacom
